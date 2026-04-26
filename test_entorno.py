import paho.mqtt.client as mqtt

# Configuración del código de prueba (Usamos EMQX que es más estable)
BROKER = "broker.emqx.io"
PUERTO = 1883
TEMA = "simca/grupo11/test_agua"

def al_conectar(client, userdata, flags, reason_code, properties):
    print(f"✅ ¡ÉXITO! Conectado al broker MQTT con código de estado: {reason_code}")
    # Simulación de validación de reglas de negocio (pH del agua)
    ph_prueba = 7.2
    if 6.5 <= ph_prueba <= 8.5:
        print(f"💧 Regla validada: El pH {ph_prueba} está en un rango seguro.")
    else:
        print(f"⚠️ Alerta: Nivel de pH {ph_prueba} fuera de rango.")
        
    client.disconnect()

def main():
    print("Iniciando prueba de entorno SIMCA...")
    cliente = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    cliente.on_connect = al_conectar
    
    try:
        # Aumentamos un poco el tiempo de espera a 60 segundos
        cliente.connect(BROKER, PUERTO, 60)
        cliente.loop_forever()
    except Exception as e:
        print(f"❌ Error de red: {e}")
        print("💡 Consejo: Si estás en una red universitaria, es posible que el puerto 1883 esté bloqueado.")

if __name__ == "__main__":
    main()