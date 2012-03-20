describe "The truth", ->
  it "should be true", ->
    with_fixtures "test.html", ->
      expect(true).toBeTruthy()
