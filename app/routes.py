import glob
import os
from flask import Blueprint, render_template

main = Blueprint("main", __name__)


@main.route("/")
def home():
    sound_files = glob.glob("app/static/sounds/*.mp3")

    # convert full paths → clean filenames
    sounds = [os.path.basename(f) for f in sound_files]

    return render_template("soundboard.html", sounds=sounds)