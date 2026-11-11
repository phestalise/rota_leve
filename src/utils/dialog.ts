import { Alert, Platform } from 'react-native';

/**
 * Diálogos do app.
 * No celular usamos o Alert nativo. No navegador, window.alert/confirm são bloqueados em
 * webviews e iframes (ex.: Simple Browser do VS Code) e o confirm devolve "cancelar" sem
 * aparecer, então lá o diálogo é desenhado pelo próprio app (ver components/DialogHost).
 */
export interface DialogRequest {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  resolve: (ok: boolean) => void;
}

type Listener = (req: DialogRequest) => void;
let listener: Listener | null = null;

export function setDialogListener(fn: Listener | null) {
  listener = fn;
}

function showInApp(req: Omit<DialogRequest, 'resolve'>): Promise<boolean> {
  return new Promise((resolve) => {
    if (!listener) {
      // Sem host montado: não bloqueia o fluxo.
      resolve(true);
      return;
    }
    listener({ ...req, resolve });
  });
}

export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    showInApp({ title, message, confirmLabel: 'OK' });
    return;
  }
  Alert.alert(title, message);
}

export function confirmAction(
  title: string,
  message: string,
  confirmLabel = 'Confirmar',
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return showInApp({ title, message, confirmLabel, cancelLabel: 'Cancelar', destructive: true });
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
