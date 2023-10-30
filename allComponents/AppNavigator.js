import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import VideoList from './VideoList';
import VideoPlayerScreen from './VideoPlayerScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="VideoList">
      <Stack.Screen name="VideoList" component={VideoList} options={{ title: 'VideoList' }}/>
      <Stack.Screen name="VideoPlayerScreen" component={VideoPlayerScreen} options={{ title: 'VideoPlayerScreen' }}/>
    </Stack.Navigator>
  );
};

export default AppNavigator;
