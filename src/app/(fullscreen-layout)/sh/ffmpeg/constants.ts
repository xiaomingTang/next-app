const RAW_TERMINAL_INPUT_MAP = {
  '\x7F': 'backspace' as const,
  '\x1B[3~': 'delete' as const,
  '\b': 'ctrl+backspace' as const,
  '\x1B[3;5~': 'ctrl+delete' as const,
  '\x1B[3;3~': 'alt+delete' as const,
  '\x1B\x7F': 'alt+backspace' as const,
  '\u0003': 'ctrl+c' as const,
  '\u001b[A': 'arrowup' as const,
  '\u001b[B': 'arrowdown' as const,
  '\u001b[C': 'arrowright' as const,
  '\u001b[D': 'arrowleft' as const,
}

type NamedInput =
  (typeof RAW_TERMINAL_INPUT_MAP)[keyof typeof RAW_TERMINAL_INPUT_MAP]

export const TERMINAL_INPUT_NAME_MAP: Record<NamedInput, string> = {
  backspace: '\x7F',
  delete: '\x1B[3~',
  'ctrl+backspace': '\b',
  'ctrl+delete': '\x1B[3;5~',
  'alt+delete': '\x1B[3;3~',
  'alt+backspace': '\x1B\x7F',
  'ctrl+c': '\u0003',
  arrowup: '\u001b[A',
  arrowdown: '\u001b[B',
  arrowright: '\u001b[C',
  arrowleft: '\u001b[D',
}

export const TERMINAL_INPUT_MAP: Record<string, NamedInput | undefined> =
  RAW_TERMINAL_INPUT_MAP
