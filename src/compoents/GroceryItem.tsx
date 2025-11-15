import { Grocery } from "@/types/grocery.type";
import { View, Text, TouchableOpacity } from "react-native";
import { Card, Checkbox, IconButton } from "react-native-paper";

type Props = {
  data: Grocery;
  onToggleBought?: (id: number, bought: boolean) => void;
  onEdit?: (item: Grocery) => void;
  onDelete?: (id: number) => void;
};

const GroceryItem = ({ data, onToggleBought, onEdit }: Props) => {
  const handleToggle = () => {
    if (onToggleBought) {
      onToggleBought(data.id, !data.bought);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(data);
    }
  };

  const handleLongPress = () => {
    if (onEdit) {
      onEdit(data);
    }
  };

  return (
    <View className="px-4 py-2">
      <TouchableOpacity
        onPress={handleToggle}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        <Card>
          <Card.Content>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text
                  className={`text-lg font-semibold ${
                    data.bought ? "line-through text-gray-400" : "text-gray-800"
                  }`}
                >
                  {data.bought ? "✓ " : ""}
                  {data.name}
                </Text>
                <View className="flex-row gap-4 mt-1">
                  <Text className="text-sm text-gray-600">
                    Số lượng: {data.quantity}
                  </Text>
                  {data.category && (
                    <Text className="text-sm text-blue-600">
                      • {data.category}
                    </Text>
                  )}
                </View>
                <Text className="text-xs text-gray-400 mt-1">
                  Trạng thái: {data.bought ? "Đã mua ✓" : "Chưa mua"}
                </Text>
              </View>
              <View className="flex-row items-center">
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={handleEdit}
                  iconColor="#60a5fa"
                />
                <Checkbox
                  status={data.bought ? "checked" : "unchecked"}
                  onPress={handleToggle}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </View>
  );
};

export default GroceryItem;
