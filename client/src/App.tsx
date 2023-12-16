
import { Client } from "@heroiclabs/nakama-js"
import { useEffect, useState } from "react"


function App() {
  const [checkLogin, setCheckLogin] = useState<boolean>(false)
  const [client, setClient] = useState<Client | null>(null)

  useEffect(() => {
    /* init clien */
    const useSSL = false;
    const client = new Client("defaultkey", "127.0.0.1", "7350", useSSL);
    if (client) {
      setClient(client)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      email: (e.target as any).email.value,
      password: (e.target as any).password.value
    }
    const session = await client?.authenticateEmail(data.email, data.password);
    console.log(session);
  }
  return (
    <>
      {checkLogin ? (
        <div>
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
