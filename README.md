## Installation

Execute the following commands:

    cd ~ && npm install node-webui-installer`
    echo "export PATH=\$PATH:~/node_modules/.bin" >> ~/.profile

## Init WebUI project

Execute the following commands:

    npm init
    npm install --save-dev node-webui-installer

## Commands list

Install WebUI library

    webui install

Update WebUI library

    webui update

Update only for vendors

    webui update --only-vendor

Clean up vendors - keep files defined in the file `webui-grunt.json`

    webui grunt

