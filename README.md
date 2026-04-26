# SIMCA - Sistema de Monitoreo y Control de Agua 💧

Este proyecto forma parte de la asignatura de Ingeniería en la Universidad Andrés Bello. **SIMCA** es una solución IoT diseñada para el monitoreo en tiempo real de parámetros críticos del agua, utilizando el protocolo MQTT para la transmisión de datos y lógica de validación automatizada.

---

## 1. Configuración del Entorno de Desarrollo

Este sistema ha sido migrado a **Python** para optimizar el ciclo de desarrollo y facilitar el prototipado ágil de las historias de usuario.

### Software y Frameworks
* **Lenguaje:** Python (Base del sistema).
* **Protocolo de Comunicación:** MQTT vía la librería `paho-mqtt`.
* **IDE Recomendado:** Visual Studio Code con la extensión de Python instalada.

### Versiones del Stack
* **Python:** 3.10 o superior (64-bit).
* **paho-mqtt:** v2.1.0.
* **Broker MQTT:** `broker.emqx.io` (Puerto 1883).

### Manual de Instalación (Paso a Paso)

1. **Clonación del Repositorio:**
   ```bash
   git clone [https://github.com/RGVenegas/SIMCA.git](https://github.com/RGVenegas/SIMCA.git)
   cd SIMCA