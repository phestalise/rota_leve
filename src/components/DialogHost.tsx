import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing, themed } from '../theme';
import { DialogRequest, setDialogListener } from '../utils/dialog';
import { Button, T } from './ui';

/** Renderiza os diálogos de confirmação/aviso dentro do app (usado no navegador). */
export default function DialogHost() {
  const [req, setReq] = useState<DialogRequest | null>(null);

  useEffect(() => {
    setDialogListener(setReq);
    return () => setDialogListener(null);
  }, []);

  function close(ok: boolean) {
    req?.resolve(ok);
    setReq(null);
  }

  return (
    <Modal visible={!!req} transparent animationType="fade" onRequestClose={() => close(false)}>
      <Pressable style={styles.backdrop} onPress={() => close(false)} accessibilityLabel="Fechar">
        <Pressable style={styles.card} onPress={() => {}} accessibilityRole="alert">
          <T variant="h2">{req?.title}</T>
          {req?.message ? <T variant="body">{req.message}</T> : null}
          <View style={styles.actions}>
            {req?.cancelLabel ? (
              <Button
                title={req.cancelLabel}
                variant="secondary"
                size="sm"
                onPress={() => close(false)}
                style={{ flex: 1 }}
              />
            ) : null}
            <Button
              title={req?.confirmLabel ?? 'OK'}
              size="sm"
              onPress={() => close(true)}
              style={{ flex: 1 }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    card: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.line,
      padding: spacing.xl,
      gap: spacing.sm,
    },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  }),
);
