const RAW_TERMINAL_INPUT_MAP = {
  '\x7F': 'backspace' as const,
  '\x1B[3~': 'delete' as const,
  '\b': 'ctrl+backspace' as const,
  '\x1B[3;5~': 'ctrl+delete' as const,
  '\x1B[3;3~': 'alt+delete' as const,
  '\x1B\x7F': 'alt+backspace' as const,
  '\u0003': 'ctrl+c' as const,
}

type NamedInput =
  (typeof RAW_TERMINAL_INPUT_MAP)[keyof typeof RAW_TERMINAL_INPUT_MAP]

export const TERMINAL_INPUT_MAP: Record<string, NamedInput | undefined> =
  RAW_TERMINAL_INPUT_MAP
