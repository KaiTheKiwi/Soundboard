# Soundboard
soundboard with a lot of sounds

make sure python is installed

copy the folder location of SOUNDBOARD
open a terminal

cd "path to the Soundboard folder"
pip install -r requirements.txt
python -m waitress --port=8000 wsgi:app

it should say something like

INFO:waitress:Serving on http://0.0.0.0:8000

to open the soundboard, go to http://localhost:8000
or replace the 8000 with whatever it says after the :