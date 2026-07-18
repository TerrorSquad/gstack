type ConfirmState = {
  message: string
  resolve: (confirmed: boolean) => void
} | null

export function useConfirm() {
  const confirmState = useState<ConfirmState>('confirm-state', () => null)

  function confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      confirmState.value = { message, resolve }
    })
  }
  return { confirmState, confirm }
}
