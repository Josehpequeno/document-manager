package responses

type ErrorResponse struct {
	ErrorMessage string `json:"error"`
}

type ErrorResponseWithDetails struct {
	ErrorMessage string `json:"error"`
	Details      string `json:"details"`
}

type MessageResponse struct {
	Message string `json:"message"`
}
