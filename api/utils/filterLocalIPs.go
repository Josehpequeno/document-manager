package utils

import (
	"net"
	"strings"
)

func isInSameSubnet(ip string, subnet string) bool {
	ipAddr := net.ParseIP(ip)
	_, ipNet, _ := net.ParseCIDR(subnet)
	return ipNet.Contains(ipAddr)
}

func filterLocalIPs(subnet string) []string {
	var allowedOrigins []string

	interfaces, err := net.Interfaces()
	if err != nil {
		return allowedOrigins
	}

	for _, iface := range interfaces {
		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}

		for _, addr := range addrs {
			ip := strings.Split(addr.String(), "/")[0]
			if isInSameSubnet(ip, subnet) {
				allowedOrigins = append(allowedOrigins, "http://"+ip)
			}
		}
	}
	return allowedOrigins
}
