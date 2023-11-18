import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By



url = r"https://www.glastonburyfestivals.co.uk/index.html"
# url = r"https://www.glastonburyfestivals.co.uk/information/tickets/"
driver_path = r"C:\Users\callu\OneDrive\Documents\coding\chromedriver-win64\chromedriver-win64\chromedriver.exe"

s = Service(driver_path)
chrome_options = webdriver.ChromeOptions()
chrome_options.add_experimental_option(
    "prefs", {
       "profile.managed_default_content_settings.images": 2, 
        "profile.default_content_settings.cookies": 2
            },
)

driver = webdriver.Chrome(service=s, options=chrome_options)
driver.set_page_load_timeout(4)

driver.get(url)
initial_html = driver.page_source


while True:
    driver.refresh()
    current_html = driver.page_source

    # if current_html != initial_html:
    if driver.find_elements(By.CSS_SELECTOR, "input"): 
    # if driver.find_elements(By.CSS_SELECTOR, "h1.slabtextdone"):
        print('wooowooooo')
        print("HTML content changed!")
        break

    time.sleep(0.01)
