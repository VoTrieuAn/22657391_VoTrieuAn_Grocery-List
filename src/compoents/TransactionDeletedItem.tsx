import { Transaction } from "@/types/grocery.type";
import { View, Text } from "react-native";
import { Button, Card } from "react-native-paper";

type Props = {
  data: Transaction;
  onRestore?: (id: number) => void;
};
const TransactionDeletedItem = ({ data, onRestore }: Props) => {
  return (
    <View className="px-4 py-2">
      <Card>
        <Card.Title title={`Title: ${data.title}`} />
        <Card.Content>
          <Text>Số tiền: {data.amount}</Text>
          <Text>Loại: {data.type}</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => onRestore(data.id)}>
            Khôi phục
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};
export default TransactionDeletedItem;
