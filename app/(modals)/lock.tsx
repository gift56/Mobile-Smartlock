import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as LocalAuthentication from "expo-local-authentication";

const LockModalScreen = () => {
  const [code, setCode] = useState<number[]>([]);
  const codeLength = Array(6).fill(0);
  const router = useRouter();
  const offset = useSharedValue(0);
  const animateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });

  const OFFSET = 20;
  const TIME = 80;

  useEffect(() => {
    if (code.length === 6) {
      if (code.join("") === "123456") {
        router.replace("/");
        setCode([]);
      } else {
        offset.value = withSequence(
          withTiming(-OFFSET, { duration: TIME / 2 }),
          withRepeat(withTiming(OFFSET, { duration: TIME }), 4, true),
          withTiming(0, { duration: TIME / 2 })
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setCode([]);
      }
    }
    return () => {};
  }, [code]);

  const onNumberPress = useCallback(
    (number: number) => {
      if (code.length < 6) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCode((prevCode) => [...prevCode, number]);
      }
    },
    [code]
  );

  const onNumberBackPress = useCallback(() => {
    if (code.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCode((prevCode) => prevCode.slice(0, -1));
    }
  }, [code]);

  const onBioMetricPress = async () => {
    const { success } = await LocalAuthentication.authenticateAsync();
    if (success) {
      router.replace("/");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <SafeAreaView>
      <Text style={style.greeting}>Welcome back 👋</Text>
      <Animated.View style={[style.codeView, animateStyle]}>
        {codeLength.map((_, index) => (
          <View
            key={index}
            style={[
              style.codeEmpty,
              {
                backgroundColor: code[index] ? "#3D38ED" : "#D8DCE2",
              },
            ]}
          />
        ))}
      </Animated.View>
      <View style={[style.numbersView]}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
          <TouchableOpacity
            key={number}
            onPress={() => onNumberPress(number)}
            style={style.numberContainer}
          >
            <Text style={style.number}>{number}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={onBioMetricPress}
          style={style.iconContainer}
        >
          <MaterialCommunityIcons
            name="face-recognition"
            size={26}
            color="black"
          />
        </TouchableOpacity>
        <View style={style.iconContainer}>
          {code.length > 0 && (
            <TouchableOpacity onPress={onNumberBackPress}>
              <MaterialCommunityIcons
                name="backspace-outline"
                size={26}
                color="black"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LockModalScreen;

export const style = StyleSheet.create({
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    alignSelf: "center",
  },
  codeView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginVertical: 100,
  },
  codeEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  numbersView: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 30,
    marginHorizontal: 40,
  },
  numberContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  number: {
    fontSize: 32,
  },
});
