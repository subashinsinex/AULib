import React from "react";
import { TouchableWithoutFeedback, View, Keyboard } from "react-native";
import colors from "../constants/colors";

const FillerComponent = () => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1, backgroundColor: "transparent" }} />
    </TouchableWithoutFeedback>
  );
};

export default FillerComponent;
