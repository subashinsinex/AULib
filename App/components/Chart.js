import React from "react";
import { Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { TouchableWithoutFeedback, Keyboard } from "react-native";
import dimensions from "../constants/dimensions";
import styles from "../styles";
import colors from "../constants/colors";

export default function Chart({ title, data }) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View>
        <Text style={styles.chartTitle}>{title}</Text>
        <BarChart
          data={data}
          width={dimensions.screenWidth - 40}
          height={dimensions.chartHeight}
          chartConfig={{
            backgroundColor: colors.primary,
            backgroundGradientFrom: colors.primary,
            backgroundGradientTo: colors.primary,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          style={styles.chart}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
