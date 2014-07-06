tessel-nrf-sender
=================

Send light level via NRF24 module, toggle on sound event.

Requires a Tessel with the rf-nrf24 and ambient-attx4 modules.

* rf-nrf24 in port C
* ambient-attx4 in port D

The program reads the ambient light level once per second (or two) and transmits
the level in the range 0-255 to the receiver device. Any loud sound, such as a clap,
will toggle the light on and off.

See https://github.com/SomeoneWeird/tessel-nrf-receiver

The receiver controls an LED using a GPIO output pin in PWM mode.
The LED brightness is greater when the received light level is small; i.e. a night light.

Note: the rate of transimit is quite low - the world's slowest light switch -
because otherwise the RF modules end up with queued messages, causing increasing lag
between light level changes and LED updates.

Note: if the rf-nrf module never becomes READY, try force re-flashing the firmware on the
Tessel. This fixed the issue on multiple boards for us.

Note: there was a bug in the rf-nrf24 module (magicnums.js line 6) that [@SomeoneWeird](https://github.com/SomeoneWeird)
fixed with a pull request - attempt to use .forEach on a string did not work on the
Tessel device, although it works in node.

Note: if the 2.4 GHz spectrum is busy or noisy, messages sent via the RF module will
be lost. Since we send continuous updates, we do not use message retries.
