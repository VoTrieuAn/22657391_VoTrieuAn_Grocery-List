import { Link, useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

export default function Page() {
  const router = useRouter();
  return (
    <View className="flex flex-1 items-center mt-4">
      <View className="w-full m-4 gap-3">
        <Text className="text-lg font-bold text-blue-400">
          Thông tin sinh viên
        </Text>
        <TextInput label={"Họ và tên"} value="Võ Triều An" />
        <TextInput label={"MSSV"} value="22657391" />
        <TextInput label={"Lớp HP"} value="DHKTPM18ATT" />
        <Button
          mode="contained"
          onPress={() => router.navigate("/(tabs)/list")}
        >
          Qua trang quản lý
        </Button>
      </View>
    </View>
  );
}
