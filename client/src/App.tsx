
import { Channel, Client, Session, Socket } from "@heroiclabs/nakama-js"
import { Modal, message } from "antd"
import { useEffect, useState } from "react"


function App() {
  const [checkLogin, setCheckLogin] = useState<boolean>(false)
  const [client, setClient] = useState<Client>()
  const [account, setAccount] = useState<any>(null)
  const [socket, setSocket] = useState<Socket>()
  const [roomname, setRoomname] = useState<string>("Cồng đồng")
  const [codeRoom, setCodeRoom] = useState<number>(1)
  const [channel, setChannel] = useState<Channel>()
  const [messege, setMessege] = useState<string>()
  const [listMesseger, setLisMesseger] = useState<{
    channel_id: string,
    code: number,
    content: {
      messeger: string
    },
    create_time: string,
    message_id: string,
    persistent: boolean,
    room_name: string,
    sender_id: string,
    update_time: string,
    username: string
  }[]>([])

  useEffect(() => {
    /* init clien */
    const useSSL: boolean = false;
    const clientPost = new Client("defaultkey", "127.0.0.1", "7350", useSSL);
    if (clientPost) {
      setClient(clientPost)
      if (!client) {
        setClient(clientPost)
      }
    }

  }, [])

  // thông tin tài khoản
  const getAccountUser = async (session: Session) => {

    const account = await client?.getAccount(session);
    setAccount(account)
  }

  // xác người dùng
  useEffect(() => {
    const authtoken = window.localStorage.getItem("nkauthtoken");
    const refreshtoken = window.localStorage.getItem("nkrefreshtoken");
    if (!authtoken || !refreshtoken) return
    const session = Session.restore(authtoken, refreshtoken);
    checkTime(session)
    getAccountUser(session)
    connectSocket(session)
    setCheckLogin(true)
  }, [client])

  // connect socket 
  async function connectSocket(session: Session) {
    const secure = false;
    const trace = false;
    const socket = client?.createSocket(secure, trace);
    if (!socket) return
    try {
      await socket.connect(session, false);
      setSocket(socket)
      console.log(socket)
    } catch (error) {
      setCheckLogin(false)
    }

  }
  // lắng nghe kênh chat
  useEffect(() => {
    if (!socket) return
    socket.onchannelmessage = (message) => {
      setLisMesseger([message, ...listMesseger])
    };
    // kết nối kênh chat mặc định
    joinChannelChat(roomname, codeRoom, false, false)
  }, [roomname, socket, listMesseger])

  // kết nối kênh chat 

  async function joinChannelChat(roomname: string, type: number, persistence: boolean, hidden: boolean) {
    if (!socket) return
    const channel = await socket.joinChat(roomname, type, persistence, hidden);
    if (!channel) return
    setChannel(channel)
  }

  // check token hết  hạn
  async function checkTime(session: Session | undefined) {
    const unixTimeInFuture = Date.now() + 8.64e+7;
    if (session?.isexpired(unixTimeInFuture / 1000)) {
      try {
        session = await client?.sessionRefresh(session);
      }
      catch (e) {
        Modal.error({
          title: "Thông Báo",
          content: "hết hạn phiên đăng nhập",
          onOk: () => {
            setCheckLogin(false)
          }
        })
      }
    }
  }

  // submit form 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      email: (e.target as any).email.value,
      password: (e.target as any).password.value
    }
    try {
      const session = await client?.authenticateEmail(data.email, data.password);
      if (!session) throw new Error("lỗi đăng nhập")
      localStorage.setItem("nkauthtoken", session?.token)
      localStorage.setItem("nkrefreshtoken", session?.refresh_token)
      Modal.success({
        title: "Thông Báo",
        content: "Đăng nhập thành công",
        onOk: () => {
          window.location.reload();
        },
        onCancel: () => {
          window.location.reload();
        }
      })

    } catch (error) {
      message.error("Lỗi đăng nhập")
    }
  }
  // nhập tin nhắn
  function handleMesseger(e: React.FormEvent) {
    e.preventDefault();
    const context = { "messeger": messege };
    if (channel)
      socket?.writeChatMessage(channel?.id, context);
  }
  return (
    <>
      {checkLogin ? (
        <div>
          <h3>Nakama chat room: {roomname}</h3>
          <h4>chào: {account?.user.username}  </h4>
          <form className="form-messeger">
            <input type="text" onChange={(e) => setMessege(e.target.value)} />
            <button onClick={(e: React.FormEvent) => handleMesseger(e)}>Sent</button>
          </form>
          <div>
            {listMesseger.map((chat) => (
              <div>
                <b>{chat.username}</b>
                <i>{chat.create_time}</i>
                <p key={chat.message_id}>{chat?.content.messeger}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={(e: React.FormEvent) => handleSubmit(e)}>
          <div>
            <label htmlFor="">
              <input name="email" type="email" placeholder="Your email" />
            </label>

          </div>
          <div>
            <label htmlFor="">
              <input name="password" type="password" placeholder="Your password" />
            </label>
          </div>
          <button type="submit">gửi</button>
        </form>

      )}

    </>
  )
}

export default App
