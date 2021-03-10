import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

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
    fontStyle: 'italic',
    color: '#485696'
  },
  announcementHigh: {
    fontStyle: 'italic',
    color: '#F4D35E'
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
    <View style={styles.bubble} key={props.id}>
      <Text style={[styles.handle, props.handleStyle]}>{props.from}</Text>
      <Text style={props.textStyle}>{props.text}</Text>
    </View>
  );
}
  