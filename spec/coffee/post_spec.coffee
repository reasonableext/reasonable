describe "The truth", ->
  it "should be true", ->
    run_with_fixtures "test.html", ->
      expect(true).toBeTruthy()
