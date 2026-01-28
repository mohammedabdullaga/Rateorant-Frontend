import { createContext, useState } from 'react'

const UserContext = createContext()

const getUserFromToken = () => {
  const token = localStorage.getItem('token')

  if (!token) return null

  const tokenParts = token.split('.')
  const encodedPayload = tokenParts[1]
  const decodedPayload = atob(encodedPayload)
  const parsedPayload = JSON.parse(decodedPayload)
  
  const user = {
    id: parsedPayload.sub,
    username: parsedPayload.username,
    email: parsedPayload.email,
    role: parsedPayload.role || 'user'
  }

  return user
}

function UserProvider({ children }) {

  const [user, setUser] = useState(getUserFromToken())

  const value = { user, setUser }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export { UserProvider, UserContext }
