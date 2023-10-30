import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';

const VideoList = ({ navigation }) => {
    const [videoFiles, setVideoFiles] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        getVideosFromDevice();
    }, []);

    const getVideosFromDevice = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission denied to access media');
            }

            const media = await MediaLibrary.getAssetsAsync({ mediaType: 'video', first: 100 });
            if (media.totalCount > 0) {
                setVideoFiles(media.assets);
            } else {
                throw new Error('No MP4 files found');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const playVideo = (videoUri) => {
        navigation.navigate('VideoPlayerScreen', { videoUri });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Select a video to Play</Text>
            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : selectedVideo ? (
                <View style={styles.videoContainer}>
                    <Video
                        source={selectedVideo}
                        style={styles.video}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping
                    />
                    <TouchableOpacity onPress={() => setSelectedVideo(null)}>
                        <Text style={styles.closeButton}>Close Video</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={videoFiles}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => playVideo(item.uri)}>
                            <View style={styles.videoItem}>
                                <Text style={styles.videoName}>{item.filename}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    videoContainer: {
        flex: 1,
    },
    video: {
        flex: 1,
    },
    closeButton: {
        color: 'blue',
        textAlign: 'center',
    },
    videoItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    videoName: {
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
});

export default VideoList;
