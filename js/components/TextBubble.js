import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { TERTIARY, ACCENT, ACCENT_WARM, ACCENT_HOT } from '../styles';

const styles = StyleSheet.create({
  bubble: {
    paddingHorizontal: 10,
    marginVertical: 5
  },
  handle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  announcementLow: {
    color: TERTIARY
  },
  announcementHigh: {
    color: ACCENT_WARM
  },
  ghostly: {
    color: TERTIARY
  }
});

export default function Bubble(props) {
  if (props.from == '__announcement_low') {
    return (
      <View style={styles.bubble} key={props.id}>
        <Text style={styles.announcementLow}>{props.text}</Text>
      </View>
    );
  }

  if (props.from == '__announcement_high') {
    return (
      <View style={styles.bubble} key={props.id}>
        <Text style={styles.announcementHigh}>{props.text}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.bubble, props.bubbleStyle]} key={props.id}>
      <Text style={[styles.handle, props.handleStyle, props.ghostly && styles.ghostly]}>{props.from}</Text>
      <Text style={[props.textStyle, props.ghostly && styles.ghostly]}>{props.text}</Text>
    </View>
  );
}
  