import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';

import { ShowWhen } from '../hoc';
import { sleep } from '../utils';

const PRIMARY = '#0D0628';

const styles = StyleSheet.create({
  container: {
    backgroundColor: PRIMARY,
    height: '100%',
    paddingLeft: 10
  },
  modalBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    width: 250,
    height: 200,
    padding: 10,
    backgroundColor: PRIMARY,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputContainer: {
    marginLeft: 20,
    marginTop: 10,
    paddingRight: 20
  },
  inputLabel: {
    fontSize: 16
  },
  input: {
    fontSize: 32,
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'grey'
  },
  header: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nextButton: {
    backgroundColor: 'red',
    borderRadius: 40 / 2
  },
  messageContainer: {
    flexDirection: 'row',
    marginTop: 10
  }
});

const fakeMembers = ['steve', 'chenchen', 'qin', 'rubob', 'william', 'helo', 'yyyyfjewfewfe', 'fsdfdsfdsfdsfdsfd'];

class Handle extends React.Component {
  state = {
    handle: '',
    inputLengthValid: false,
    screenState: 'WaitingForInput', // enum('WaitingForInput', 'Loading', 'Failed')
    errMessage: ''
  }

  componentDidMount() {
    console.log(this.props.members);
  }

  validateInputLength = input => {
    return input.length > 0 && input.length <= 16;
  }

  validateInput = input => {
    if (!input.match(/^[a-zA-Z0-9_/-]+$/g)) {
      return 'Name must consist of letters, numbers, and underscore.';
    }

    return null;
  }

  handleNext = () => {
    this.setStateAsync({screenState: 'Loading'})
      .then(() => {
        let errMessage = this.validateInput(this.state.input);

        if (!errMessage) {
          throw new Error(errMessage);
        }

        return sleep(3000);
      })
      .then(() => {
        this.setState({screenState: 'WaitingForInput'})
      })
      .catch(err => {
        this.setState({
          screenState: 'Failed',
          errMessage: err.message
        });
      })
  }

  setStateAsync = newState => {
    return new Promise((resolve, _) => {
      this.setState(newState, resolve);
    });
  }

  nextButtonDisabled = () => {
    return !this.state.inputLengthValid || this.state.screenState == 'Loading';
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={this.props.navigation.goBack}>
            <Icon
              name='chevron-back-outline'
              size={40}
              color='white'
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.nextButton,
              {backgroundColor: this.nextButtonDisabled() ? 'grey' : 'red'}
            ]}
            disabled={this.nextButtonDisabled()}
            onPress={this.handleNext}
          >
            <Icon
              name='chevron-forward-outline'
              size={40}
              color='white'
            />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter your name:</Text>
          <TextInput
            style={styles.input}
            maxLength={16}
            onChangeText={text => {
              this.setState({
                handle: text,
                inputLengthValid: this.validateInputLength(text),
                screenState: 'WaitingForInput'
              });
            }}
          />
          <View style={styles.messageContainer}>
            <ShowWhen condition={this.state.screenState == 'Loading'}>
              <Text style={{color: 'grey'}}>Validating{this.state.input}...</Text>
              <ActivityIndicator size='small' color='grey' />
            </ShowWhen>
            <ShowWhen condition={this.state.screenState == 'Failed'}>
              <Text style={{color: 'red'}}>{this.state.errMessage}</Text>
            </ShowWhen>
          </View>
        </View>
        <ScrollView contentContainerStyle={{width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', marginTop: 10}}>
          {fakeMembers.map(item => <Text style={{marginHorizontal: 10, fontSize: 18, marginTop: 10}}>{item}</Text>)}
        </ScrollView>
      </SafeAreaView>
    );
  }
};

function mapStateToProps(state) {
  return {
    members: state.members
  };
}

export default connect(mapStateToProps, null)(Handle);

// export default Handle;