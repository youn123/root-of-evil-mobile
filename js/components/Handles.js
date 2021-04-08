import React from 'react';
import { Text } from 'react-native';

export default function Handles(props) {
  let style = props.nameColor ? {color: props.nameColor} : null;
  let texts = [];

  style = [style, props.handleStyle];

  if (props.names.length == 0) {
    return '';
  }
  if (props.names.length == 1) {
    return <Text style={style}>{props.names[0]}</Text>;
  }
  if (props.names.length == 2) {
    return (
      <Text>
        <Text style={style}>{props.names[0]}</Text> and <Text style={style}>{props.names[1]}</Text>
      </Text>
    );
  }

  for (let i = 0; i < props.names.length - 1; i++) {
    texts.push(<Text style={style}>{props.names[i]}</Text>);
    texts.push(<Text>, </Text>);
  }

  return (
    <Text>
      {texts}
      <Text>and </Text>
      <Text style={style}>{props.names[props.names.length - 1]}</Text>
    </Text>
  );
}