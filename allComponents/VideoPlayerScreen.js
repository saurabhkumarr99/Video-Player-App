import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableWithoutFeedback, Animated, Easing, Text } from 'react-native';
import { Video } from 'expo-av';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';

const VideoPlayerScreen = ({ route }) => {
  const { videoUri } = route.params;
  const video = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const spinButtonValue = new Animated.Value(0);
  const [isMaximized, setIsMaximized] = useState(false);

  const spin = spinButtonValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const playPauseButtonAnimation = () => {
    spinButtonValue.setValue(0);
    Animated.timing(spinButtonValue, {
      toValue: 1,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true
    }).start();
  };

  const handlePlayPause = async () => {
    playPauseButtonAnimation();
    if (video.current) {
      if (isPlaying) {
        await video.current.pauseAsync();
        setIsPlaying(false);
      } else {
        if (isVideoEnded) {
          await video.current.replayAsync();
          setIsVideoEnded(false);
          setIsPlaying(true);
        } else {
          await video.current.playAsync();
          setIsPlaying(true);
        }
      }
    }
  };

  const handleSliderChange = (value) => {
    if (video.current) {
      setSliderValue(value);
      const newPosition = value * videoDuration;
      setCurrentPosition(newPosition);
      video.current.setPositionAsync(newPosition);
    }
  };

  const handleVideoLoaded = (videoStatus) => {
    setVideoDuration(videoStatus.durationMillis);
  };

  const handleVideoEnd = () => {
    setIsVideoEnded(true);
    setIsPlaying(false);
  };

  const formatTime = (time) => {
    const seconds = Math.floor(time / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds - minutes * 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleCancel = async () => {
    if (video.current) {
      await video.current.stopAsync();
      setIsPlaying(false);
      setIsVideoEnded(false);
      setCurrentPosition(0);
      setSliderValue(0);
      playPauseButtonAnimation();
    }
  };

  const handleMaximize = () => {
    setIsMaximized(true);
  };

  const handleMinimize = () => {
    setIsMaximized(false);
  };

  useEffect(() => {
    if (video.current) {
      video.current.setOnPlaybackStatusUpdate(videoStatus => {
        handleVideoLoaded(videoStatus);
        if (!isPlaying && !isVideoEnded) {
          setCurrentPosition(videoStatus.positionMillis);
          setSliderValue(videoStatus.positionMillis / videoDuration);
        }
        if (videoStatus.didJustFinish) {
          handleVideoEnd();
        }
      });
    }
  }, [video.current]);

  return (
    <View style={{ flex: 1 }}>
      <Video
        ref={video}
        source={{ uri: videoUri }}
        useNativeControls
        resizeMode={isMaximized ? 'cover' : 'contain'}
        style={{ width: '100%', height: isMaximized ? '95%' : 300 }}
        onPlaybackStatusUpdate={(videoStatus) => {
          handleVideoLoaded(videoStatus);
          if (!isPlaying && !isVideoEnded) {
            setCurrentPosition(videoStatus.positionMillis);
            setSliderValue(videoStatus.positionMillis / videoDuration);
          }
          if (videoStatus.didJustFinish) {
            handleVideoEnd();
          }
        }}
      />
      <View>
        {(isMaximized || !isMaximized) && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback onPress={handlePlayPause}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <MaterialIcons
                  name={isVideoEnded ? 'replay' : isPlaying ? 'pause' : 'play-arrow'}
                  size={50}
                  color="blue"
                />
              </Animated.View>
            </TouchableWithoutFeedback>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ textAlign: 'center' }}>
                {formatTime(currentPosition)} / {formatTime(videoDuration)}
              </Text>
            </View>
            <Slider
              style={{ flex: 1, height: 40, marginLeft: 10, marginRight: 10 }}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              onSlidingComplete={handleSliderChange}
              value={sliderValue}
            />
            {isMaximized ? (
              <TouchableWithoutFeedback onPress={handleMinimize}>
                <View style={{ alignItems: 'center', marginRight: 10 }}>
                  <MaterialIcons name="fullscreen-exit" size={30} color="yellow" />
                </View>
              </TouchableWithoutFeedback>
            ) : (
              <TouchableWithoutFeedback onPress={handleMaximize}>
                <View style={{ alignItems: 'center', marginRight: 10 }}>
                  <MaterialIcons name="fullscreen" size={30} color="green" />
                </View>
              </TouchableWithoutFeedback>
            )}
            <TouchableWithoutFeedback onPress={handleCancel}>
              <View style={{ alignItems: 'center' }}>
                <MaterialIcons name="cancel" size={30} color="red" />
              </View>
            </TouchableWithoutFeedback>
          </View>
        )}
      </View>
    </View>
  );
};

export default VideoPlayerScreen;