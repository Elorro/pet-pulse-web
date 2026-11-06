# Pet Pulse

**Pet Pulse** es una plataforma social para personas que quieren compartir la vida cotidiana de sus mascotas. Este repositorio contiene la aplicación web; la API de Pet Pulse está implementada en un repositorio separado con FastAPI.

## Descripción para portafolio

Desarrollé la aplicación web de Pet Pulse, una comunidad digital para conectar a personas amantes de los animales y compartir momentos de sus mascotas. La plataforma incluye una página de presentación, registro e inicio de sesión, un feed de publicaciones y flujos para crear publicaciones y comentarios con imágenes. La web se comunica con una API REST tipada y gestiona la sesión de forma segura mediante cookies del lado del servidor.

## Funcionalidades de la aplicación web

- Página pública de presentación de la comunidad.
- Registro e inicio de sesión con correo electrónico y contraseña.
- Manejo de sesión con cookies SSR y renovación de tokens.
- Feed de publicaciones conectado a la API.
- Creación de publicaciones y comentarios, con soporte para imágenes.
- Interacción para dar y quitar "me gusta" en publicaciones.
- Edición del perfil, incluido el username, el nombre y la foto de perfil.
- Perfiles públicos con publicaciones y datos básicos del usuario.
- Rutas protegidas para el feed, creación de publicaciones, notificaciones y ajustes.
- Interfaz adaptable, temas claro y oscuro, y componentes accesibles reutilizables.

## Tecnologías

- **Frontend:** Next.js 16, React 19, TypeScript.
- **Estilos e interfaz:** Tailwind CSS 4, shadcn/ui con primitivas Base UI, Lucide.
- **Backend:** API REST independiente desarrollada con FastAPI.
- **Autenticación y sesión:** Supabase Auth, `@supabase/ssr`.
- **Cliente de API:** `openapi-fetch` y tipos TypeScript generados desde OpenAPI.
- **Validación de configuración:** Zod.

## Arquitectura

La web consume la API FastAPI para las operaciones de autenticación, perfil, publicaciones, comentarios y reacciones. No consulta directamente la base de datos de Supabase ni guarda credenciales de servicio. Las solicitudes protegidas se realizan desde el servidor de Next.js y la sesión se conserva en cookies.

## Estado actual

La aplicación web está preparada para desplegarse en Vercel y requiere configurar las variables de entorno y la URL de la API. Los perfiles públicos y su edición consumen los endpoints de la API. La pantalla de notificaciones todavía está pendiente de soporte en el backend. La confirmación de correo requiere que el backend configure la URL de redirección correspondiente.

## Enlaces

- **Demo:** [agregar URL del despliegue]
- **Repositorio web:** [agregar URL del repositorio]
- **Repositorio de la API:** [agregar URL del repositorio de FastAPI]
