const baseURL = '/api';
// Función para obtener todos los mensajes
export const getMessages = async () => {
  try {
    const response = await fetch(`${baseURL}/messages`);
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
      throw new Error('Error al obtener mensajes');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    throw error; 
  }
};

// Función para enviar un nuevo mensaje
export const sendMessage = async (sender: any, content: any) => {
  try {
    const response = await fetch(`/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sender, content }),
    });
    if (!response.ok) {
      throw new Error('Error al enviar mensaje');
    }
    const data = await response.json();
    console.log("send message OK");
    return data;
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    throw error; // Lanza la excepción para que sea manejada por el llamador
  }
};
