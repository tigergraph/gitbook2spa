#!/usr/bin/env python3

import time
import traceback
import glob
import os
import tempfile
import logging
import argparse
import shutil
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


xpaths = {
	'LoginButton': "//button[@data-test='login']",
	'EmailInputBox': "//input[@type='email']",
	'PasswordInputBox': "//input[@type='password']",
	'DocumentSpace': "//span[text()='TigerGraph Documentation']",
	'DangerZone': "//div[span/text()='Danger Zone']",
	'ExportButton': "//button[span/text()='Export']",
	'EnabledExportButton': "//button[span/text()='Export'][not(@disabled)]",
}


class Downloader:
	def __init__(self, org, space, user, password, target, headless):
		self.advance_setting_url = 'https://app.gitbook.com/@{}/s/{}/~/settings/advanced'.format(org, space)
		self.user = user
		self.password = password
		# target is the package export path
		self.target = target
		self.headless = headless
		self._prepare_driver()

	def _prepare_driver(self):
		# prepare download directory
		self.download_dir = tempfile.mkdtemp()
		os.makedirs(self.download_dir, exist_ok=True)

		chrome_options = Options()  
		if self.headless:
			chrome_options.add_argument("--headless")
		chrome_options.add_argument("--disable-popup-blocking")
		driver = webdriver.Chrome(ChromeDriverManager().install(), options=chrome_options)

		# reference: https://stackoverflow.com/questions/45631715/downloading-with-chrome-headless-and-selenium
		# add missing support for chrome "send_command"  to selenium webdriver
		driver.command_executor._commands["send_command"] = ("POST", '/session/$sessionId/chromium/send_command')
		params = {'cmd': 'Page.setDownloadBehavior', 'params': {'behavior': 'allow', 'downloadPath': self.download_dir}}
		command_result = driver.execute("send_command", params)

		self.driver = driver

	def _wait_for(self, xpaths, delay=3):
		for xpath in xpaths:
			WebDriverWait(self.driver, delay).until(EC.presence_of_element_located((By.XPATH, xpath)))

	def run(self):
		try:
			fpath = self.download()
			shutil.move(fpath, self.target)
		except:
			traceback.print_exc()
		self.driver.quit()
		logging.info("file ready at %s", self.target)
	
	def download(self):
		logging.info("authenticating...")
		self.driver.get('https://app.gitbook.com/login')
		self._wait_for([xpaths['LoginButton'], xpaths['EmailInputBox'], xpaths['PasswordInputBox']], delay=15)

		email_box = self.driver.find_element_by_xpath(xpaths['EmailInputBox'])
		password_box = self.driver.find_element_by_xpath(xpaths['PasswordInputBox'])

		email_box.send_keys(self.user)
		password_box.send_keys(self.password)

		login_button = self.driver.find_element_by_xpath(xpaths['LoginButton'])
		login_button.click()
		self._wait_for([xpaths['DocumentSpace']], delay=15)
		self.driver.get(self.advance_setting_url)

		self._wait_for([xpaths['DangerZone']], delay=15)
		danger_zone = self.driver.find_element_by_xpath(xpaths['DangerZone'])
		danger_zone.click()
		
		self._wait_for([xpaths['EnabledExportButton']], delay=15)
		export_button = self.driver.find_element_by_xpath(xpaths['ExportButton'])
		export_button.click()

		logging.info("exporting...")
		self._wait_for([xpaths['EnabledExportButton']], delay=600)

		logging.info("downloading...")
		while len(glob.glob('{}/*.crdownload'.format(self.download_dir))) != 0 or len(glob.glob('{}/*.zip'.format(self.download_dir))) == 0:
			time.sleep(1)
		files = glob.glob('{}/*'.format(self.download_dir))
		return files[0]



def main():
	parser = argparse.ArgumentParser(description='Automation tool to export TigerGraph Documentation Space')
	parser.add_argument("--space", type=str, default='document')
	parser.add_argument("--org", type=str, default='tigergraph')
	parser.add_argument("--user", type=str, required=True)
	parser.add_argument("--password", type=str, required=True)
	parser.add_argument("--target", type=str, default='/tmp/gitbook.zip')
	parser.add_argument("--headless", type=bool, default=False)
	args = parser.parse_args()
	logging.basicConfig(level=logging.INFO)
	dl = Downloader(args.org, args.space, args.user, args.password, '/tmp/gitbook.zip', args.headless)
	dl.run()



if __name__ == '__main__':
	main()