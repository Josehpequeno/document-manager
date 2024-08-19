package utils

import (
	"fmt"
	"net"
	"os"
)

// getLocalIP retrieves the local IP address of the machine
func GetLocalIP() (string, error) {
	interfaces, err := net.Interfaces()
	if err != nil {
		return "", err
	}

	for _, iface := range interfaces {
		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}

		for _, addr := range addrs {
			ipnet, ok := addr.(*net.IPNet)
			if !ok || ipnet.IP.IsLoopback() || !ipnet.IP.IsGlobalUnicast() {
				continue
			}
			return ipnet.IP.String(), nil
		}
	}
	return "", fmt.Errorf("no suitable IP address found")
}

// writeEnvFile creates or updates the .env file with the API URL
func WriteEnvFile(ip string) error {
	file, err := os.Create("../frontend/.env")
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.WriteString(fmt.Sprintf("REACT_APP_LOCAL_IP=%s\n", ip))
	if err != nil {
		return err
	}

	return nil
}
