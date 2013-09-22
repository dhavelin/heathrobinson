Heath Robinson
==============

Introduction
------------

During World War II, the Germans introduced a new, highly-secure encryption machine for use by the highest ranks of the army. This was the Lorenz SZ-40 (and, later, the SZ-42a and SZ-42b). It contained 12 wheels that generated a pseudo-random key in teleprinter code (each character is 5 bits and those 5 bits can be represented by holes punched in paper tape).

The key sequence would be combined with the plaintext sequence by XOR-ing them together, character-by-character, before transmitting the resulting ciphertext.

At the receiving end, another Lorenz machine, set up in exactly the same way as the transmitting machine, would XOR the same key sequence with the ciphertext to reveal the original plaintext.

Cryptographic Attack
--------------------

Lorenz-encrypted radio transmissions were intercepted in the UK and passed to Bletchley Park for analysis. One part of the decryption process involved figuring out the wheel starting positions of the Lorenz machine. Bletchley Park cryptanalysts realised they could generate a portion of the key without knowing the start positions, then try this key against the message, cycling through all possible start positions.

By means of a logical combining function on the bits of the message and partial key and keeping a simple count of the result of that combining function at each character position, they were able to determine the most likely starting position for one or two wheels at at time.

Because of certain properties of the orginal plaintext (like the use of repeated characters, for example), the count would show a small spike when they had the partial key correctly lined up against the ciphertext.

The problem was trying all of the possible starting positions and performing an accurate count in the days before computers.

Heath Robinson
--------------

To this end, Bletchley Park built an electronic machine on which two long, looped punched tapes could be mounted. One tape help the ciphertext, the other tape held the partial key. The length of one tape was a single character longer than the other so after each cycle the offset between the tape sequences would increase.

The characters were read by photodetectors - two adjacent characters from each tape. The logical function to be applied was defined by jack plugs and implemented in a valve rack.

Implementation
--------------

The tapes are drawn off-screen in a canvas element, from a simple sequence of 5-bit numbers. They are converted to PNGs and applied as background images on-screen that can be animated using CSS. This gives the smoothest movement and 60 frames per second animation is easily achieved on a decent machine.

Such a CSS animation can generate an event every time it repeats. For the photocells, we need an event triggered for every character. So, when the tape loop animation restarts, a further timing loop is initiated that fires when the time taken for the tape to advance one character elapses. The tape animation and photocell updates are not otherwise synced and can fall out of step on less powerful machines or when the tape speed is cranked up sufficiently. This issue will be addressed.

When the photocells update, the logical function (currently hard-coded as a function on the two least significant bits of each character) is calculated and the loop score incremented or not, depending on the result.

The various components, like the tapes, the photocells, etc. are implemented as AngularJS directives. The layout and appearance is assisted by Bootstrap. The build is controlled by Grunt.
