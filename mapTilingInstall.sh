if which maptiler-server > /dev/null; then
    echo "MapTiler Server is installed."
else
    echo "Installing MapTiler Server."
    curl -L -O "https://github.com/CPRT/debian-files/raw/main/maptiler-server3.tar.gz" #get debian file from github
    tar -xzvf maptiler-server3.tar.gz # uncompress tar file
    sudo dpkg -i maptiler-server-4.6.1-linux-x64.deb 
fi
maptiler-server --adminPassword=WliDFsXY # launch server