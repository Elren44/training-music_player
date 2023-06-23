import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import BottomBar from '../components/BottomBar';
import Slider from '@react-native-community/slider';
import songs from '../model/Data';
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';

const {width, height} = Dimensions.get('window');

const setUpPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
    });

    await TrackPlayer.add(songs);
  } catch (e) {
    // console.log('asdas', e);
  }
};

const togglePlayBack = async playBackState => {
  const currentTrack = TrackPlayer.getCurrentTrack();
  if (currentTrack != null) {
    if (playBackState == State.Paused || playBackState == State.Ready) {
      await TrackPlayer.play();
    } else {
      await TrackPlayer.pause();
    }
  }
};

const MusicPlayer = () => {
  const playBackState = usePlaybackState();
  const [songIndex, setSongIndex] = useState(0);
  const progress = useProgress();
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackArtwork, setTrackArtwork] = useState('');
  const [repeatMode, setRepeatMode] = useState('off');

  // custom references
  const scrollX = useRef(new Animated.Value(0)).current;
  const songSlider = useRef(null); //flatlist reference

  //   changing the track on complete
  useTrackPlayerEvents(
    [Event.PlaybackTrackChanged, Event.PlaybackProgressUpdated],
    async event => {
      if (
        event.type === Event.PlaybackTrackChanged &&
        event.nextTrack !== null
      ) {
        const track = await TrackPlayer.getTrack(event.nextTrack);
        const {title, artwork, artist} = track;
        setTrackTitle(title);
        setTrackArtist(artist);
        setTrackArtwork(artwork);
      }

      const {position, track} = event;
      // @android-fix
      if (!track && position === 0) {
        console.log(
          'Skipping first queue ended event that happens in Android',
          event,
        );
        await TrackPlayer.pause();
        return;
      }

      if (progress.position > progress.duration) {
        // TrackPlayer.stop();
        console.log('stop');
        return;
      }
    },
  );

  const stopPlay = async () => {
    await TrackPlayer.pause();
    await TrackPlayer.seekTo(0);
  };

  useEffect(() => {
    if (
      songIndex + 1 == songs.length &&
      progress.position + 2 > progress.duration
    ) {
      stopPlay();
    }
  }, [progress.position]);

  const skipTo = async trackId => {
    await TrackPlayer.skip(trackId);
  };

  useEffect(() => {
    setUpPlayer();
    scrollX.addListener(({value}) => {
      const index = Math.round(value / width);
      skipTo(index);
      setSongIndex(index);
    });
    return () => {
      scrollX.removeAllListeners();
      // TrackPlayer.destroy();
    };
  }, []);

  const skipToNext = () => {
    songSlider.current.scrollToOffset({
      offset: (songIndex + 1) * width,
    });
  };

  const skipToPrev = () => {
    songSlider.current.scrollToOffset({
      offset: (songIndex - 1) * width,
    });
  };

  const changeRepeatMode = () => {
    if (repeatMode == 'off') {
      TrackPlayer.setRepeatMode(RepeatMode.Track);
      setRepeatMode('track');
    }

    if (repeatMode == 'track') {
      TrackPlayer.setRepeatMode(RepeatMode.Queue);
      setRepeatMode('repeat');
    }

    if (repeatMode == 'repeat') {
      TrackPlayer.setRepeatMode(RepeatMode.Off);
      setRepeatMode('off');
    }
  };

  const renderSongs = ({item, index}) => {
    return (
      <Animated.View style={styles.mainImageWrapper}>
        <View style={[styles.musicImageWrapper, styles.elevation]}>
          {trackArtwork && (
            <Image style={styles.musicImage} source={trackArtwork} />
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        {/* image */}

        <Animated.FlatList
          ref={songSlider}
          data={songs}
          renderItem={renderSongs}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {
                    x: scrollX,
                  },
                },
              },
            ],
            {useNativeDriver: true},
          )}
        />

        {/* song content */}
        <View style={styles.songContent}>
          <Text style={[styles.songContent, styles.songTitle]}>
            {trackTitle}
          </Text>
          <Text style={[styles.songContent, styles.songArtist]}>
            {trackArtist}
          </Text>
        </View>

        {/* slider */}

        <View>
          <Slider
            value={progress.position}
            style={styles.progressBar}
            minimumValue={0}
            maximumValue={progress.duration}
            thumbTintColor="#FFD369"
            minimumTrackTintColor="#FFD369"
            maximumTrackTintColor="#fff"
            onSlidingComplete={async value => {
              await TrackPlayer.seekTo(value);
            }}
          />

          {/* music progress durations */}
          <View style={styles.progressLevelDuration}>
            <Text style={styles.progressLevelText}>
              {new Date(progress.position * 1000)
                .toLocaleTimeString()
                .substring(3)}
            </Text>
            <Text style={styles.progressLevelText}>
              {new Date((progress.duration - progress.position) * 1000)
                .toLocaleTimeString()
                .substring(3)}
            </Text>
          </View>
        </View>

        {/* music control */}
        <View style={styles.musicControlsContainer}>
          <TouchableOpacity onPress={() => skipToPrev()}>
            <Ionicons name="play-skip-back-outline" size={35} color="#FFD369" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => togglePlayBack(playBackState)}>
            <Ionicons
              name={
                playBackState === State.Playing
                  ? 'ios-pause-circle'
                  : 'ios-play-circle'
              }
              size={75}
              color="#FFD369"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => skipToNext()}>
            <Ionicons
              name="play-skip-forward-outline"
              size={35}
              color="#FFD369"
            />
          </TouchableOpacity>
        </View>
      </View>

      <BottomBar
        repeatMode={repeatMode}
        setRepeatMode={setRepeatMode}
        changeRepeatMode={changeRepeatMode}
      />
    </SafeAreaView>
  );
};

export default MusicPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222831',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImageWrapper: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicImageWrapper: {
    width: 300,
    height: 340,
    marginBottom: 20,
    marginTop: 20,
    borderRadius: 15,
  },
  musicImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  elevation: {
    elevation: 5,
    shadowColor: '#ccc',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    borderColor: 'transparent',
  },
  songContent: {
    textAlign: 'center',
    color: '#eee',
  },
  songTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  songArtist: {
    fontSize: 16,
    fontWeight: '300',
  },
  progressBar: {
    width: width - 60,
    height: 40,
    marginTop: 20,
    flexDirection: 'row',
  },
  progressLevelDuration: {
    width: width - 80,
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLevelText: {
    color: '#fff',
    fontWeight: '500',
  },
  musicControlsContainer: {
    width: '60%',
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
