interface ComboPopupProps {
  message: { text: string; id: number } | null;
}

export function ComboPopup({ message }: ComboPopupProps) {
  if (!message) return null;

  return (
    <div
      key={message.id}
      style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 48,
        fontWeight: 900,
        color: '#fff',
        textShadow: '0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,107,107,0.5)',
        zIndex: 10,
        pointerEvents: 'none',
        animation: 'comboPopIn 0.4s ease-out, comboFadeOut 0.5s ease-in 2s forwards',
        whiteSpace: 'nowrap',
      }}
    >
      {message.text}
    </div>
  );
}
