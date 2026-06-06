import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image, StyleSheet, Text, View } from 'react-native';

type LiquidHeaderProps = {
  showNotifications?: boolean;
};

export function LiquidHeader({ showNotifications = false }: LiquidHeaderProps) {
  return (
    <View style={styles.topBar}>
      <View style={styles.brand}>
        <Image source={require('@/assets/images/icon.png')} style={styles.avatar} />
        <Text style={styles.brandText}>TaskFlow</Text>
      </View>
      <View style={styles.topActions}>
        <View style={styles.actionButton}>
          <MaterialIcons name="search" size={19} color="#587A6C" />
        </View>
        {showNotifications ? (
          <View style={styles.actionButton}>
            <MaterialIcons name="notifications-none" size={19} color="#587A6C" />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
    borderColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginTop: 8,
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#6D8B7A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    zIndex: 4,
  },
  brand: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.46)',
    borderColor: 'rgba(255, 255, 255, 0.74)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 12,
    paddingTop: 5,
  },
  avatar: {
    borderRadius: 16,
    height: 28,
    width: 28,
  },
  brandText: {
    color: '#557866',
    fontSize: 17,
    fontWeight: '600',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
    borderColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 17,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
});
