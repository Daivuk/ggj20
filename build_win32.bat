REM Clone onut
git submodule update --init --recursive

REM Create build dir
mkdir build

REM cd to build dir
cd build

REM We don't want to use hunter and we want to build the stand alone (onut.exe)
cmake -DONUT_USE_HUNTER=OFF -DONUT_BUILD_STANDALONE=ON -DONUT_BUILD_UI_EDITOR=ON -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF ../onut/

REM Compile
cmake --build . --target onut --config Release

REM Copy executable
cd JSStandAlone/Release
copy "onut.exe" "../../../game/ExecutableWin32.exe"

cd ../../..
