import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setToggle as setToggleAction,
  useSettingReduxToggle,
} from '@/lib/redux/slices/toggleSlice'

export default function useAppReduxToggle() {
  const dispatch = useDispatch()
  const toggleState = useSelector(useSettingReduxToggle)

  const handleOpen = useCallback(
    (key: string) => {
      dispatch(setToggleAction({ key, value: true }))
    },
    [dispatch],
  )

  const handleClose = useCallback(
    (key: string) => {
      dispatch(setToggleAction({ key, value: false }))
    },
    [dispatch],
  )

  const handleToggle = useCallback(
    (key: string) => {
      dispatch(setToggleAction({ key, value: !toggleState[key] }))
    },
    [dispatch, toggleState],
  )

  const isModalOpen = useCallback(
    (key: string) => toggleState[key],
    [toggleState],
  )

  return {
    toggleState,
    handleOpen,
    handleClose,
    handleToggle,
    isModalOpen,
  }
}
