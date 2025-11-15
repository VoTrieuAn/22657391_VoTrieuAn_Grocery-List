import { Transaction } from "@/types/grocery.type";
import { useRouter } from "expo-router";
import { View, Text } from "react-native";
import { Button, Card } from "react-native-paper";

type Props = {
  data: Transaction;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
};
const TransactionItem = ({ data, onDelete, onEdit }: Props) => {
  const router = useRouter();

  const onPressEdit = () => {
    router.push({ pathname: "/(tabs)/form", params: { id: data.id } });
  };

  return (
    <View className="px-4 py-2">
      <Card>
        <Card.Title title={`Title: ${data.title}`} />
        <Card.Content>
          <Text>Số tiền: {data.amount}</Text>
          <Text>Loại: {data.type}</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={onPressEdit}>
            Chỉnh sửa
          </Button>
          <Button mode="contained" onPress={() => onDelete(data.id)}>
            Xóa
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};
export default TransactionItem;
