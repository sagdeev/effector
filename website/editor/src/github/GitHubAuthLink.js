import React, {useRef, useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import {useStore} from 'effector-react'
import {styled} from 'linaria/react'
import {config} from './config'
import {$csrf, $githubToken, $githubUser} from './state'
import {DropDownArrow} from './icons/DropDownArrow'
import {GitHubCatIcon} from './icons/GitHubCatIcon'
import {setAuth} from './index'


const portalContainer = document.getElementById('auth-section')

const DropDownMenu = styled.div`
  transform-origin: top right;
  transform: scale(${props => props.open ? 1 : 0}) translateX(${props => props.open ? 0 : -100}px);
  transition: transform .2s;
  border: 1px solid #ccc;
  position: absolute;
  top: calc(100% + 10px);
  z-index: 101;
  right: -14px;
  background-color: white;
  color: #333;
  box-shadow: 2px 2px 12px #aaa;
  padding: 5px 0px;
  list-style: none;
  &::after {
    opacity: ${props => props.open ? 1 : 0};
    transition: opacity .3s;
    content: '';
    position: absolute;
    border: 10px solid transparent;
    border-bottom-color: white;
    top: -20px;
    right: 30px;
    left: auto;
  }
`

const MenuItem = styled.div`
  padding: 5px 20px;
  transition: background-color .25s, color .25s;
  background-color: transparent;
  color: #333;
  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
`

const MenuDivider = styled.div`
  height: 1px;
  border: none;
  background-color: #eee;
`

const GitHubUserMenu = ({user, ...props}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const closeMenu = (e) => {
    const {left, right, top, bottom} = ref.current.getBoundingClientRect()
    if (e.pageX < left || e.pageX > right || e.pageY < top || e.pageY > bottom) {
      setOpen(false)
    }
  }

  useEffect(() => {
    open && window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  }, [open])

  return ReactDOM.createPortal((
      <div style={{
        alignSelf: 'center',
        marginLeft: 40,
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: 100,
        overflow: 'auto',
        ...props.style,
      }}>
        <div
          style={{
            alignSelf: 'center',
            display: 'flex',
            alignItems: 'center',
            ...props.style,
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(state => !state)
          }}
        >
          <img src={user.avatarUrl} alt={user.name} style={{margin: '0 5px 0 0'}} />
          <DropDownArrow />
        </div>
        <DropDownMenu open={open} ref={ref}>
          <div style={{margin: '5px 20px 10px 20px'}}>
            Signed in as <span style={{fontWeight: 'bold'}}>{user.name}</span>
          </div>
          <MenuDivider />
          <MenuItem onClick={() => setAuth(null)}>
            Sign out
          </MenuItem>
        </DropDownMenu>
      </div>
    ),
    portalContainer,
  )
}

export const GitHubAuthLink = ({token, ...props}) => {
  return ReactDOM.createPortal(
    <a href="#"
      // target="_blank"
       {...props}
       style={{
         alignSelf: 'center',
         marginLeft: 40,
         zIndex: 100,
         paddingRight: 10,
         ...props.style,
       }}
       onClick={(e) => {
         e.preventDefault()
         const csrf = Math.random().toString(36)
         $csrf.setState(csrf)
         config.githubAuthUrl.searchParams.set('state', csrf)
         console.log(config.githubAuthUrl.href)
         location.replace(config.githubAuthUrl.href)
       }}
    >
      <GitHubCatIcon />
      Sign in
    </a>,
    portalContainer,
  )
}

export const GitHubAuth = (props) => {
  const token = useStore($githubToken)
  const userInfo = useStore($githubUser)
  // config.githubAuthUrl.searchParams.set('redirect_uri', location.href)

  if (token) {
    return <GitHubUserMenu user={userInfo} />
  } else {
    return <GitHubAuthLink token={token} />
  }
}
