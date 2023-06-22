import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width, height} = Dimensions.get('window');

const BottomBar = ({repeatMode, setRepeatMode, changeRepeatMode}) => {
  const repeatIcon = () => {
    if (repeatMode == 'off') {
      return 'repeat-off';
    }

    if (repeatMode == 'track') {
      return 'repeat-once';
    }

    if (repeatMode == 'repeat') {
      return 'repeat';
    }
  };

  return (
    <View style={styles.bottomContainer}>
      <View style={styles.iconWrapper}>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="heart-outline" size={30} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => changeRepeatMode()}>
          <MaterialCommunityIcons
            name={repeatIcon()}
            size={30}
            color={repeatMode !== 'off' ? '#FFD369' : '#888888'}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="share-outline" size={30} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="ellipsis-horizontal" size={30} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BottomBar;

const styles = StyleSheet.create({
  bottomContainer: {
    width: width,
    alignItems: 'center',
    paddingVertical: 15,
    borderTopColor: '#393E46',
    borderWidth: 1,
    marginTop: 20,
  },
  iconWrapper: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-between',
  },
});
