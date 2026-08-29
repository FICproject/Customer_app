import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useToastStore } from '../store/toastStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';

export default function Snackbar() {
  const visible = useToastStore((state) => state.visible);
  const message = useToastStore((state) => state.message);
  const actionText = useToastStore((state) => state.actionText);
  const onAction = useToastStore((state) => state.onAction);
  const hideToast = useToastStore((state) => state.hideToast);
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom + 65, 75) }]}>
      <View style={styles.toastCard}>
        <View style={styles.iconCircle}>
          <Icons.ShoppingBag color="#F4C400" size={14} />
        </View>

        <Text style={styles.messageText} numberOfLines={1}>
          {message}
        </Text>

        {actionText ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              hideToast();
              if (onAction) onAction();
            }}
          >
            <Text style={styles.actionText}>{actionText}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.closeBtn} onPress={hideToast}>
            <Icons.X color="#9CA3AF" size={16} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#172033',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    width: '100%',
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(244, 196, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  messageText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: '#F4C400',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  actionText: {
    color: '#0F172A',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
