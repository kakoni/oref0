#!/usr/bin/env node

/*
  oref0 CSF autotuning data prep tool

  Collects glucose data for periods dominated by carb absorption
  for use in oref0 autotuning algorithm

  Released under MIT license. See the accompanying LICENSE.txt file for
  full terms and conditions

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.

*/

var generate = require('oref0/lib/autotune-prep');
function usage ( ) {
        console.error('usage: ', process.argv.slice(0, 2), '<pumphistory.json> <profile.json> <clock.json> <glucose.json> <basalprofile.json> [carbhistory.json]');
}

if (!module.parent) {
    var pumphistory_input = process.argv.slice(2, 3).pop();
    if ([null, '--help', '-h', 'help'].indexOf(pumphistory_input) > 0) {
      usage( );
      process.exit(0)
    }
    var profile_input = process.argv.slice(3, 4).pop();
    var clock_input = process.argv.slice(4, 5).pop();
    var glucose_input = process.argv.slice(5, 6).pop();
    var basalprofile_input = process.argv.slice(6, 7).pop();
    var carb_input = process.argv.slice(7, 8).pop()

    if (!pumphistory_input || !profile_input || !clock_input || !glucose_input || !basalprofile_input) {
        usage( );
        console.log('{ "error": "Insufficient arguments" }');
        process.exit(1);
    }

    var fs = require('fs');
    try {
        var pumphistory_data = JSON.parse(fs.readFileSync(pumphistory_input, 'utf8'));
        var profile_data = JSON.parse(fs.readFileSync(profile_input, 'utf8'));
        var clock_data = JSON.parse(fs.readFileSync(clock_input, 'utf8'));
        var basalprofile_data = JSON.parse(fs.readFileSync(basalprofile_input, 'utf8'));
    } catch (e) {
        console.log('{ "error": "Could not parse input data" }');
        return console.error("Could not parse input data: ", e);
    }

    // disallow impossibly low carbRatios due to bad decoding
    if ( typeof(profile_data.carb_ratio) == 'undefined' || profile_data.carb_ratio < 3 ) {
        console.log('{ "carbs": 0, "mealCOB": 0, "reason": "carb_ratio ' + profile_data.carb_ratio + ' out of bounds" }');
        return console.error("Error: carb_ratio " + profile_data.carb_ratio + " out of bounds");
    }

    try {
        var glucose_data = JSON.parse(fs.readFileSync(glucose_input, 'utf8'));
    } catch (e) {
        console.error("Warning: could not parse "+glucose_input);
    }

    var carb_data = { };
    if (typeof carb_input != 'undefined') {
        try {
            carb_data = JSON.parse(fs.readFileSync(carb_input, 'utf8'));
        } catch (e) {
            console.error("Warning: could not parse "+carb_input);
        }
    }

    var inputs = {
        history: pumphistory_data
    , profile: profile_data
    , basalprofile: basalprofile_data
    , clock: clock_data
    , carbs: carb_data
    , glucose: glucose_data
    };

    var prepped_glucose = generate(inputs);
    console.log(JSON.stringify(prepped_glucose));
}

