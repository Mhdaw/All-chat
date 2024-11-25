
import { createChat } from './actions';
import { NavigateToChat } from './navigate';

export default async function Page() {
  const chat = await createChat()
  console.log(chat);
  if(chat){
    return <NavigateToChat chat={chat} ></NavigateToChat>
  }

  return (
    <>
      Generating chats ......
    </>
  );
}
