// app/index.tsx
import { Redirect } from "expo-router";

export default function Index() {
  // TODO: Sau này bạn có thể viết logic kiểm tra Token ở đây.
  // const hasToken = checkSecureStore();
  // return hasToken ? <Redirect href="/home" /> : <Redirect href="/welcome" />;

  // Hiện tại, cứ mở app lên là đá thẳng sang màn hình Welcome
  return <Redirect href="/welcome" />;
}