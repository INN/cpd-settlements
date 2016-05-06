import requests
import sys

def check_boundary_service():
    url = "http://localhost:8000/1.0/boundary/"
    try:
        result = requests.get(url)
        if result.status_code == 200:
            print "Boundary service is available"
            sys.exit(0)
    except requests.ConnectionError:
        print "Unable to reach boundary service"
        sys.exit(1)
