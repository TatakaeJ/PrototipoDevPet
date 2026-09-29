import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';

// Importamos el catálogo y los servicios
import { PET_CATALOG } from '../../src/constants/shop';
import { getUserInventory, purchasePet, equipPet, getUserInfo } from '../../src/services/habits.service';
import { styles } from '../../styles/shopStyles/Shop.styles';

/**
 * Componente de la Tienda de Mascotas.
 * Permite al usuario usar sus puntos (diamantes) para comprar y equipar mascotas.
 * 
 * @component
 */
const Shop = ({ userId, currentPoints, onPointsUpdate, onEquipSuccess }) => {
  const [inventory, setInventory] = useState([]);
  const [equippedPet, setEquippedPet] = useState('gato');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Para mostrar carga en botones específicos

  const loadShopData = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Obtenemos el inventario de mascotas compradas
      const userPets = await getUserInventory(userId);
      // Aseguramos que el 'gato' (mascota base) siempre esté en el inventario local
      if (!userPets.includes('gato')) userPets.push('gato');
      setInventory(userPets);

      // 2. Obtenemos la mascota equipada actualmente
      const userInfo = await getUserInfo(userId);
      if (userInfo && userInfo.equipped_pet) {
        setEquippedPet(userInfo.equipped_pet);
      }
    } catch (error) {
      console.error("Error cargando la tienda:", error);
      Alert.alert("Error", "No se pudo cargar el inventario.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadShopData();
  }, [loadShopData]);

  const handlePurchase = async (pet) => {
    if (currentPoints < pet.price) {
      return Alert.alert("Ups", "No tienes suficientes diamantes 💎 para esta mascota.");
    }

    Alert.alert(
      "Confirmar Compra",
      `¿Deseas comprar a ${pet.name} por ${pet.price} 💎?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Comprar", 
          onPress: async () => {
            try {
              setProcessingId(pet.id);
              const result = await purchasePet(pet.id, pet.price, userId);
              
              if (result.success) {
                // Actualizamos inventario y puntos en la UI
                setInventory(prev => [...prev, pet.id]);
                if (onPointsUpdate) onPointsUpdate(result.newPoints);
                Alert.alert("¡Felicidades!", `Has adoptado a ${pet.name}.`);
              }
            } catch (error) {
              Alert.alert("Error en compra", error.message);
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  const handleEquip = async (pet) => {
    if (equippedPet === pet.id) return;

    try {
      setProcessingId(pet.id);
      await equipPet(pet.id, userId);
      setEquippedPet(pet.id);
      
      // Avisamos al HomeScreen para que actualice la vista de la mascota
      if (onEquipSuccess) onEquipSuccess(pet.id);
      
    } catch (error) {
      Alert.alert("Error", "No se pudo equipar la mascota.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4B9FE1" />
        <Text style={{ marginTop: 10, color: 'white' }}>Cargando tienda...</Text>
      </View>
    );
  }

  // Convertimos el catálogo en un array para poder renderizarlo
  const petsArray = Object.values(PET_CATALOG);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tienda de Mascotas</Text>
        <Text style={styles.subtitle}>Tus diamantes: {currentPoints} 💎</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {petsArray.map((pet) => {
          const isOwned = inventory.includes(pet.id);
          const isEquipped = equippedPet === pet.id;
          const isProcessing = processingId === pet.id;

          return (
            <View key={pet.id} style={[styles.card, isEquipped && styles.cardEquipped]}>
              <View style={styles.imageContainer}>
                <Image source={pet.image} style={styles.petImage} resizeMode="contain" />
              </View>
              
              <View style={styles.infoContainer}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petDescription}>{pet.description}</Text>
                
                {!isOwned && (
                  <Text style={styles.priceText}>Precio: {pet.price} 💎</Text>
                )}

                <View style={styles.actionContainer}>
                  {isOwned ? (
                    <TouchableOpacity 
                      style={[styles.btn, isEquipped ? styles.btnEquipped : styles.btnEquip]}
                      disabled={isEquipped || isProcessing}
                      onPress={() => handleEquip(pet)}
                    >
                      <Text style={styles.btnText}>
                        {isProcessing ? "Procesando..." : isEquipped ? "Equipado ✅" : "Equipar"}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.btn, styles.btnBuy, currentPoints < pet.price && styles.btnDisabled]}
                      disabled={isProcessing || currentPoints < pet.price}
                      onPress={() => handlePurchase(pet)}
                    >
                      <Text style={styles.btnText}>
                        {isProcessing ? "Comprando..." : "Comprar"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Shop;