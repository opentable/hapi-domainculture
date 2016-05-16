const expect = require('expect.js');
const plugin = require('../index.js');
const pkg = require('../package.json');

describe('plugin attributes', function() {
  it('should contain name', function() {
    expect(plugin.register.attributes.name).to.equal('hapi-domainculture');
  });

  it('should contain version', function() {
    expect(plugin.register.attributes.version).to.equal(pkg.version);
  });
});
