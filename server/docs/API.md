# Tome21 API

Base URL:
apiurl/api

## Products

### Get all products

GET /products

Response:

[
{
"id": 1,
"name": "Nike Air Max",
"description": "Comfortable running shoes",
"price": "4500.00",
"category_id": 1,
"category_name": "Shoes",
"image_url: "https://example.com/nike-front.jpg"
}
]

### Create product

POST /products

Body:

{
"name": "Nike Air Max",
"description": "Comfortable running shoes",
"price": 4500,
"stock": 10,
"condition", "new",
"category_id": 1
}

Response: { id + itself }

### Get product by ID

GET /products/1 (:id)

Response:

{
"id": 1,
"name": "Nike Air Max",
"description": "Comfortable running shoes",
"price": "5000.00",
"stock": 15,
"category_id": 1,
"condition": "used",
"category_name": "Shoes",
"created_at": "...",
"updated_at": "...",
"images": [
{
"id": 1,
"image_url": "https://example.com/nike-front.jpg",
"sort_order": 0
},
{
"id": 2,
"image_url": "https://example.com/nike-side.jpg",
"sort_order": 1
}
]
}

### Update product

PUT /products/1 (:id)

Body:

{
"name": "Nike Air Max Updated",
"description": "Updated running shoes",
"price": 5000,
"stock": 15,
"condition": "new"
"category_id": 1
}

Response: { id + itself }

### Delete product

DELETE /products/1

response:

{
"message": "Product deleted successfully",
"product": {
itself
}
}

## catagories

### Create catagory

POST /catagories

body:
{
"name": "Electronics",
"public_id": "..........",
"image_url": "............",
}

### Get all catagories

GET /categories

response:

[
{
"id": "2",
"name": "Electronics",
"image_url": ".............."
"created_at": "2026-10-04T13:16:31.427Z"
}
]

### Get catagory by id

GET /categories/1 (:id)

response:

{
"id": "2",
"name": "Electronics",
"image_url": "..............",
"created_at": "2026-10-04T13:16:31.427Z"
}

### Update Catagory

PUT /categories/1 (:id)

Body:
{
"name": "Running Shoes",
"public_id": "..........",
"image_url": ".............."
}

Response: {id + itself}

### Delete catagory

DELETE /categories/1 (:id)

Response:

{
"message": "Category deleted successfully",
"catagory": {itself}
}

## product Images

### create Product img

POST /product-images/product/1

Body:
{
"public_id": "tome21/products/product_45/abc123",
"image_url": "https://example.com/nike-front.jpg",
"sort_order": 0
}

Response:

{
"id": "1",
"product_id": "1",
"public_id": "tome21/products/product_45/abc123"
"image_url": "https://example.com/nike-front.jpg",
"sort_order": 0
}

### Get all img for a product

Get /product-images/product/1

res:
[
{
"id": "1",
"product_id": "1",
"image_url": "https://example.com/nike-front.jpg",
"sort_order": 0
}
]

### Get single img

GET /product-images/1

res :
{
"id": "1",
"product_id": "1",
"image_url": "https://example.com/nike-side.jpg",

"sort_order": 3
}

### Update product_img

PUT /product-images/1

Body:
{
"public_id": "tome21/products/product_45/abc123",
"image_url": "https://example.com/nike-new.jpg",
"sort_order": 0
}

res:

{
"id": "1",
"product_id": "1",
"public_id": "tome21/products/product_45/abc123",
"image_url": "https://example.com/nike-side.jpg",
"sort_order": 3
}

### Delete Prod_img

DELETE /product-images/2

res:
{
"message": "Product image deleted successfully",
"image": {
"id": "2",
"product_id": "1",
"public_id": "tome21/products/product_45/abc123",
"image_url": "https://example.com/nike-side.jpg",
"sort_order": 1
}
}

## Cart

### Create cart

POST /cart

Body:
user_id comest from the middleware so we dont need i on the body

{
"product_id": 1,
"quantity": 2
}

Response:
{
"id": "1",
"user_id": "1",
"product_id": "1",
"quantity": 2
}

### Get cart by user id

GET /cart
user id is from middleware
Response:
{
"items": [
{
"id": "1",
"product_id": "1",
"name": "Nike Air Max",
"price": "4500.00",
"stock": 10,
"quantity": 2,
"subtotal": "9000.00",
"image_url": "https://example.com/nike-side.jpg"
}
],
"total": "9000.00"
}

### Update cart

PUT /cart/1 (:productId)
user_id is from middleware
body:

{
"quantity": 3
}

response:
{
"id": "1",
"user_id": "1",
"product_id": "1",
"quantity": 3
}

### remove from cart

DELETE /cart/1 (:productId)

response:

{
"message": "Item removed from cart",
"item": {
"id": "1",
"user_id": "1",
"product_id": "1",
"quantity": 3
}
}

### clear cart

DELETE /cart

response:
{
"message": "Cart cleared successfully"
}

## Orders

### Create orders

first u should add sth in cart

POST /api/orders

Body:
{
"shipping_address": "Bole, Addis Ababa",
"shipping_phone": --------,
}

response:
{
"id": "1",
"user_id": "1",
"total_amount": "9000.00",
"status": "pending",
"shipping_address": "Bole, Addis Ababa",
"shipping_phone": "+2519--------",
"created_at": "2026-10-05T12:13:08.961Z",
"updated_at": "2026-10-05T12:13:08.961Z"
}

it removes cart and decrease stock

### Get orders

GET /orders
user id is from
response:

[
{
"id": "1",
"total_amount": "9000.00",
"status": "pending",
"shipping_address": "Bole, Addis Ababa",
"shipping_phone": "+2519--------",
"created_at": "2026-10-05T12:13:08.961Z",
"updated_at": "2026-10-05T12:13:08.961Z"
}
]

### Get single order

GET /api/orders/1 (:id)

Response:

{
"id": "1",
"total_amount": "9000.00",
"status": "pending",
"shipping_address": "Bole, Addis Ababa",
"shipping_phone": "+2519--------",
"created_at": "2026-10-05T12:13:08.961Z",
"updated_at": "2026-10-05T12:13:08.961Z",
"items": [
{
"id": "1",
"product_id": "1",
"name": "Nike Air Max",
"quantity": 2,
"price": "4500.00",
"subtotal": "9000.00"
}
]
}

# Authentication API

Base URL:

```text
apiurl/api/auth
```

Authentication uses **Google OAuth 2.0** with Passport.js and server-side sessions.

---

## 1. Login with Google

### `GET /api/auth/google`

Starts the Google OAuth login process.

The user should open this endpoint in a browser. They will be redirected to Google to authenticate.

### Request

```http
GET /api/auth/google
```

### Response

Redirects the user to Google's authentication page.

After successful authentication, Google redirects to:

```text
GET /api/auth/google/callback
```

---

## 2. Google OAuth Callback

### `GET /api/auth/google/callback`

Handles the response from Google after authentication.

The backend:

1. Receives the Google profile.
2. Searches for the user using `google_id`.
3. Creates the user if they don't exist.
4. Updates the user's information if they already exist.
5. Creates the login session.
6. Makes the authenticated user available through `req.user`.

### Successful Response

```json
{
  "message": "Login successful",
  "user": {
    "id": "2",
    "google_id": "104595567437904654509",
    "name": "Dawit Tesfaye",
    "email": "tesfayedawit22090582@gmail.com",
    "image_url": "https://lh3.googleusercontent.com/...",
    "created_at": "2026-10-06T11:14:37.984Z",
    "updated_at": "2026-10-06T11:14:37.984Z"
  }
}
```

The user's session is also created automatically.

---

## 3. Get Current User

### `GET /api/auth/me`

Returns the currently authenticated user.

### Request

```http
GET /api/auth/me
```

The request must contain a valid authentication session.

### Success Response

```json
{
  "user": {
    "id": "2",
    "google_id": "104595567437904654509",
    "name": "Dawit Tesfaye",
    "email": "tesfayedawit22090582@gmail.com",
    "image_url": "https://lh3.googleusercontent.com/...",
    "created_at": "2026-10-06T11:14:37.984Z",
    "updated_at": "2026-10-06T11:14:37.984Z"
  }
}
```

### Unauthenticated Response

**Status:** `401 Unauthorized`

```json
{
  "error": "Not authenticated"
}
```

---

## 4. Logout

### `POST /api/auth/logout`

Logs the current user out and destroys their authentication session.

### Request

```http
POST /api/auth/logout
```

### Success Response

**Status:** `200 OK`

```json
{
  "message": "Logged out successfully"
}
```

---

## Authentication Behavior

After successful Google authentication, the backend stores the user's database ID in the session.

Protected routes use the authentication middleware:

```text
Google Login
     ↓
Passport
     ↓
users table
     ↓
Session
     ↓
req.user
     ↓
Protected API routes
```

The frontend does **not** send `user_id` when accessing user-specific resources.

For example:

```http
GET /api/cart
```

The backend determines the user from the authentication session.

---

## Protected Endpoints

The following endpoints require authentication:

```text
GET    /api/auth/me

GET    /api/cart
POST   /api/cart
PUT    /api/cart/:productId
DELETE /api/cart/:productId
DELETE /api/cart

POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
```

Unauthenticated requests receive:

```json
{
  "error": "Authentication required"
}
```

with status:

```text
401 Unauthorized
```
