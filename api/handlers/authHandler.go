package handlers

import (
	"document-manager/api/models"
	"document-manager/database"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte(os.Getenv("API_SECRET"))

type Claims struct {
	UserID   uuid.UUID `json:"user_id"`
	IsMaster *bool     `json:"is_master,omitempty"` //O uso de omitempty na tag JSON garante que o campo não será incluído no token se for nil.
	jwt.StandardClaims
}

type LoginBody struct {
	UsernameOrEmail string `json:"username_or_email"`
	Password        string `json:"password"`
}

type LoginResponse struct {
	Message      string       `json:"message"`
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	User         UserResponse `json:"user"`
}

func VerifyPassword(password, hashedPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

func generateTokens(userID uuid.UUID, isMaster *bool) (string, string, error) {
	//gerar token de acesso
	accessTokenExp := time.Now().Add(time.Hour * 24)
	accessTokenClaims := &Claims{
		UserID:   userID,
		IsMaster: isMaster,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: accessTokenExp.Unix(),
		},
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessTokenClaims)
	accessTokenStr, err := accessToken.SignedString(jwtKey)
	if err != nil {
		return "", "", err
	}

	//  gerar token de atualização
	refreshTokenExp := time.Now().Add(time.Hour * 24 * 7)
	refreshTokenClaims := &Claims{
		UserID:   userID,
		IsMaster: isMaster,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: refreshTokenExp.Unix(),
		},
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshTokenClaims)
	refreshTokenStr, err := refreshToken.SignedString(jwtKey)
	if err != nil {
		return "", "", err
	}

	return accessTokenStr, refreshTokenStr, nil
}

// LoginHandler make login of user.
// @Summary Login
// @Description login of users
// @ID login
// @Tags Auth
// @Accept json
// @Produce json
//
//	@Success 200 {object} LoginResponse
//
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /login [post]
func LoginHandler(c *gin.Context) {
	var loginData LoginBody

	if err := c.BindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data"})
		return
	}

	db := database.GetDB()

	var user models.User
	if err := db.Where("email = ?", loginData.UsernameOrEmail).First(&user).Error; err != nil {
		//se não for email verificar se foi passado o nome
		if err := db.Where("name = ?", loginData.UsernameOrEmail).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
	}

	err := VerifyPassword(loginData.Password, user.Password)

	if err != nil && err == bcrypt.ErrMismatchedHashAndPassword {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	accessToken, refreshToken, err := generateTokens(user.ID, user.Master)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating tokens"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Login successful",
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"user":          user,
	})
}

func AuthMiddleware(c *gin.Context) {
	tokenString := c.GetHeader("Authorization")

	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Missing token"})
		c.Abort()
		return
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtKey), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token"})
		c.Abort()
		return
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token"})
		c.Abort()
		return
	}

	c.Set("claims", claims)

	c.Next()
}

func AuthMiddlewareMaster(c *gin.Context) {
	tokenString := c.GetHeader("Authorization")

	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Missing token"})
		c.Abort()
		return
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtKey), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token"})
		c.Abort()
		return
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token"})
		c.Abort()
		return
	}

	if claims.IsMaster != nil && *claims.IsMaster {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}

	c.Set("claims", claims)

	c.Next()
}
